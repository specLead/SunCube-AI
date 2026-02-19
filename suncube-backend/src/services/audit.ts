import { Knex } from 'knex';

export async function writeAuditLog(
  db: Knex, 
  userId: string, 
  action: string, 
  resourceType: string, 
  resourceId: string, 
  meta: object = {}
) {
  try {
    await db('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      meta: JSON.stringify(meta)
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}
