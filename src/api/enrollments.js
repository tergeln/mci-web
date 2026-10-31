import { ApiError, request } from './client';
import { enrollments, newId, notFound, payments } from './mock/db';

import { contentStore } from './managedContent';
import { recordStore } from './localRecords';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+0-9 ()-]{8,20}$/;

/**
 * POST /api/enrollments
 * Нээлттэй курс status "pending_payment", хүлээлгийн жагсаалттай курс "waitlisted".
 */
export function createEnrollment({ courseId, name, email, phone }) {
  const body = { courseId, name: name?.trim(), email: email?.trim(), phone: phone?.trim() };
  return request('/enrollments', {
    method: 'POST',
    body,
    mock: () => {
      const fields = {};
      if (!body.name || body.name.length > 100) fields.name = 'required, max 100 characters';
      if (!EMAIL.test(body.email ?? '')) fields.email = 'invalid email';
      if (!PHONE.test(body.phone ?? '')) fields.phone = 'invalid phone';
      if (Object.keys(fields).length) throw new ApiError(400, 'validation_error', 'Invalid input', fields);

      const course = contentStore.list('courses').find((c) => c.id === body.courseId);
      if (!course) throw notFound('Course');
      if (course.status === 'planned') throw new ApiError(409, 'enrollment_closed', 'Enrollment is not open');

      const duplicate = recordStore.list().some((e) => !e.deletedAt && e.status !== 'cancelled' && e.courseId === course.id && e.email?.toLowerCase() === body.email.toLowerCase());
      if (duplicate) throw new ApiError(409, 'already_enrolled', 'Already enrolled');

      const enrollment = {
        id: newId('enr'),
        courseId: course.id,
        status: course.status === 'open' ? 'pending_payment' : 'waitlisted',
        createdAt: new Date().toISOString(),
      };
      const account = JSON.parse(localStorage.getItem('mc-demo-accounts-v1') || '[]').find((user) => user.email === body.email.toLowerCase());
      const userId = body.email.toLowerCase() === 'user@magiccode.mn' ? 'student' : body.email.toLowerCase() === 'admin@magiccode.mn' ? 'admin' : account?.id || `guest:${body.email.toLowerCase()}`;
      recordStore.add({ type: 'course', userId, items: [course.title.mn], courseId: course.id, name: body.name, email: body.email.toLowerCase(), phone: body.phone, enrollmentStatus: enrollment.status });
      enrollments.set(enrollment.id, { ...enrollment, email: body.email });
      return enrollment;
    },
  });
}

/** POST /api/payments — бүртгэлийн төлбөр эхлүүлэх. method: "qpay" | "bank" */
export function createPayment({ enrollmentId, method }) {
  return request('/payments', {
    method: 'POST',
    body: { enrollmentId, method },
    mock: () => {
      if (!['qpay', 'bank'].includes(method)) {
        throw new ApiError(400, 'validation_error', 'Invalid input', { method: 'must be qpay or bank' });
      }
      const enrollment = enrollments.get(enrollmentId);
      if (!enrollment) throw notFound('Enrollment');
      if (enrollment.status !== 'pending_payment') {
        throw new ApiError(409, 'payment_not_required', 'This enrollment does not need payment');
      }
      const course = contentStore.list('courses').find((c) => c.id === enrollment.courseId);
      const payment = {
        id: newId('pay'),
        enrollmentId,
        method,
        status: 'pending',
        amount: course?.price ?? null,
        currency: 'MNT',
        // Бодит backend энд QPay QR эсвэл банкны мэдээлэл буцаана (docs/API.md).
        instructions: null,
        createdAt: new Date().toISOString(),
      };
      payments.set(payment.id, payment);
      return payment;
    },
  });
}
