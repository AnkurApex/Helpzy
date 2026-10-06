import { NextResponse } from 'next/server';

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function sessionError(session) {
  return jsonError(session.error, session.status);
}
