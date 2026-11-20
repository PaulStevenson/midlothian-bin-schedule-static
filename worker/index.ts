export default {
  async fetch(_request: Request): Promise<Response> {
    return new Response('Push reminders are temporarily disabled.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  },
}
