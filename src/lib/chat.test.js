import { afterEach, expect, mock, test } from "bun:test";
const topics = new Set;
const removed = [];
let ownerFilter;
let signedIn = true;
mock.module("@/integrations/supabase/client", () => ({
  supabase: {
    channel: (topic) => {
      if (topics.has(topic))
        throw new Error("Channel topic reused");
      topics.add(topic);
      const channel = { topic, on: () => channel, subscribe: () => channel };
      return channel;
    },
    removeChannel: (channel) => {
      removed.push(channel.topic);
      topics.delete(channel.topic);
    },
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: "customer-id" } : null }, error: null }) },
    from: () => ({ select: () => ({ eq: async (column, id) => {
      ownerFilter = [column, id];
      return { data: [{ unread_for_user: 2 }, { unread_for_user: 3 }], error: null };
    } }) })
  }
}));
const events = new EventTarget;
const timers = new Set;
Object.assign(globalThis, {
  window: {
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
    setInterval: (cb, ms) => {
      const timer = setInterval(cb, ms);
      timers.add(timer);
      return timer;
    },
    clearInterval: (timer) => {
      clearInterval(timer);
      timers.delete(timer);
    }
  },
  document: { visibilityState: "visible" }
});
const { subscribeChat, unreadForUser } = await import("./chat");
afterEach(() => {
  for (const timer of timers)
    clearInterval(timer);
  timers.clear();
  topics.clear();
  removed.length = 0;
  ownerFilter = undefined;
  signedIn = true;
});
test("customer panel, widget and admin listeners coexist and clean up independently", () => {
  let refreshes = 0;
  const stops = [subscribeChat(() => refreshes++), subscribeChat(() => refreshes++), subscribeChat(() => refreshes++)];
  expect(topics.size).toBe(3);
  events.dispatchEvent(new Event("tokyobs-chat-changed"));
  expect(refreshes).toBe(3);
  for (const stop of stops)
    stop();
  expect(removed.length).toBe(3);
  expect(topics.size).toBe(0);
  expect(timers.size).toBe(0);
  events.dispatchEvent(new Event("tokyobs-chat-changed"));
  expect(refreshes).toBe(3);
});
test("customer unread count is filtered by authenticated owner, not caller email", async () => {
  expect(await unreadForUser("another-customer@example.com")).toBe(5);
  expect(ownerFilter).toEqual(["owner_id", "customer-id"]);
});
test("visitor has zero unread messages and never queries private thread counters", async () => {
  signedIn = false;
  expect(await unreadForUser("guest@example.com")).toBe(0);
  expect(ownerFilter).toBeUndefined();
});
