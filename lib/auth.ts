import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE_NAME = "bb_dashboard_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type DashboardSession = {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
};

type SessionUser = {
  id: string;
  email: string;
  name: string;
};

function getSessionSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.FONNTE_TOKEN ||
    process.env.SUPABASE_KEY ||
    "barber-booking-local-dev-secret"
  );
}

function signValue(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function encodeSession(session: DashboardSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signValue(payload);

  return `${payload}.${signature}`;
}

function decodeSession(value: string) {
  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signValue(payload);
  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const validSignature = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!validSignature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as DashboardSession;

    if (!session.userId || !session.email || !session.name || !session.expiresAt) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, savedKey] = storedHash.split(":");

  if (!salt || !savedKey) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  if (savedKey.length !== derivedKey.toString("hex").length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(savedKey, "hex"), derivedKey);
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;

  cookieStore.set(
    SESSION_COOKIE_NAME,
    encodeSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      expiresAt,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    }
  );
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return decodeSession(sessionCookie.value);
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
