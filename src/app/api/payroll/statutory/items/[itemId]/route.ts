import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deriveReturnStatus } from '@/lib/statutory-returns';

const ALLOWED_STATUS = new Set(['pending', 'prepared', 'submitted', 'paid', 'overdue'] as const);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const statusInput = typeof body.status === 'string' ? body.status : null;
    if (!statusInput || !ALLOWED_STATUS.has(statusInput as never)) {
      return NextResponse.json({ error: 'Invalid item status' }, { status: 400 });
    }

    const referenceNumber = typeof body.referenceNumber === 'string' ? body.referenceNumber.trim() : undefined;
    const paymentReference = typeof body.paymentReference === 'string' ? body.paymentReference.trim() : undefined;
    const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;
    const now = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.statutoryReturnItem.update({
        where: { id: itemId },
        data: {
          status: statusInput,
          ...(referenceNumber !== undefined ? { referenceNumber: referenceNumber || null } : {}),
          ...(paymentReference !== undefined ? { paymentReference: paymentReference || null } : {}),
          ...(notes !== undefined ? { notes: notes || null } : {}),
          submittedAt: statusInput === 'submitted' ? now : statusInput === 'pending' || statusInput === 'prepared' ? null : undefined,
          paidAt: statusInput === 'paid' ? now : statusInput === 'pending' || statusInput === 'prepared' || statusInput === 'submitted' ? null : undefined,
        },
        select: { statutoryReturnId: true },
      });

      const parent = await tx.statutoryReturn.findUnique({
        where: { id: item.statutoryReturnId },
        include: { items: { select: { status: true, dueDate: true } } },
      });
      if (parent) {
        const dueDate = parent.items[0]?.dueDate ?? new Date();
        const returnStatus = deriveReturnStatus(parent.items.map((i) => i.status), dueDate);
        await tx.statutoryReturn.update({
          where: { id: parent.id },
          data: {
            status: returnStatus,
            submittedAt:
              returnStatus === 'filed' || returnStatus === 'paid'
                ? parent.submittedAt || now
                : returnStatus === 'draft'
                  ? null
                  : parent.submittedAt,
            paidAt: returnStatus === 'paid' ? parent.paidAt || now : returnStatus === 'draft' ? null : parent.paidAt,
          },
        });
      }
      return item;
    });

    return NextResponse.json({ ok: true, statutoryReturnId: updated.statutoryReturnId });
  } catch (error) {
    console.error('[payroll statutory item PATCH]', error);
    return NextResponse.json({ error: 'Failed to update statutory item' }, { status: 500 });
  }
}
