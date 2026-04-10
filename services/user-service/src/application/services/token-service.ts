import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export type JwtUserClaims = {
  sub: string;
  email: string;
};

export class TokenService {
  signAccessToken(params: {
    secret: Secret;
    expiresIn: NonNullable<SignOptions["expiresIn"]>;
    user: { id: string; email: string };
  }): string {
    const payload: JwtUserClaims = { sub: params.user.id, email: params.user.email };
    return jwt.sign(payload, params.secret, { expiresIn: params.expiresIn });
  }
}

