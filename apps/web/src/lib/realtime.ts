import Pusher from "pusher";
import PusherClient from "pusher-js";

export function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    return null;
  }

  return new PusherClient(key, { cluster });
}

export function boardChannel(boardId: string) {
  return `private-board-${boardId}`;
}

export async function broadcastBoardEvent(
  boardId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(boardChannel(boardId), event, payload);
}
