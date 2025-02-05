import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/constants';
import { TokenPayload } from '../../shared/types/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      reply.status(401).send({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    request.user = decoded;
  } catch (error) {
    reply.status(401).send({ message: 'Invalid or expired token' });
  }
};
