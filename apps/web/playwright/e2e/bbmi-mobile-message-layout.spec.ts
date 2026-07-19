/*
Copyright 2026 Element Creations Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import { test, expect } from "../element-web-test";
import { Bot } from "../pages/bot";

test.describe("BBMI mobile message layout", () => {
    test.use({ displayName: "Alice" });

    test("keeps short, replied, consecutive, and selected messages separate", async ({
        page,
        app,
        homeserver,
        user,
    }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        void user;
        await app.client.prepareClient();

        const bob = new Bot(page, homeserver, { displayName: "Bob" });
        await bob.prepareClient();
        const roomId = await app.client.createRoom({
            name: "Mobile message layout",
            invite: [bob.credentials!.userId],
        });
        await bob.joinRoom(roomId);

        const shortIncoming = await bob.sendMessage(roomId, "1");
        const shortOutgoing = await app.client.sendMessage(roomId, "Hi");
        const reply = await app.client.sendMessage(roomId, {
            "msgtype": "m.text",
            "body": "What was that?",
            "m.relates_to": { "m.in_reply_to": { event_id: shortIncoming.event_id } },
        });
        const nextOutgoing = await app.client.sendMessage(roomId, "A consecutive message");

        await app.viewRoomById(roomId);
        await expect(page.getByText("A consecutive message", { exact: true })).toBeVisible();

        const eventLine = (eventId: string) =>
            page.locator(`.mx_EventTile[data-event-id="${eventId}"] > .mx_EventTile_line`);
        const shortIncomingLine = eventLine(shortIncoming.event_id);
        const shortOutgoingLine = eventLine(shortOutgoing.event_id);
        const replyLine = eventLine(reply.event_id);
        const nextOutgoingLine = eventLine(nextOutgoing.event_id);

        await expect(shortIncomingLine).toBeVisible();
        await expect(shortOutgoingLine).toBeVisible();
        await expect(replyLine).toBeVisible();
        await expect(nextOutgoingLine).toBeVisible();

        const shortIncomingBox = await shortIncomingLine.boundingBox();
        const shortOutgoingBox = await shortOutgoingLine.boundingBox();
        const replyBox = await replyLine.boundingBox();
        const nextOutgoingBox = await nextOutgoingLine.boundingBox();
        expect(shortIncomingBox!.height).toBeLessThanOrEqual(50);
        expect(shortOutgoingBox!.height).toBeLessThanOrEqual(50);
        expect(replyBox!.width).toBeGreaterThanOrEqual(200);
        expect(replyBox!.y + replyBox!.height).toBeLessThanOrEqual(nextOutgoingBox!.y);

        const replyTileBox = await replyLine.locator(".mx_ReplyTile").boundingBox();
        expect(replyTileBox!.x).toBeGreaterThanOrEqual(replyBox!.x);
        expect(replyTileBox!.x + replyTileBox!.width).toBeLessThanOrEqual(replyBox!.x + replyBox!.width);

        await replyLine.hover();
        const actionBar = replyLine.locator(".mx_MessageActionBar");
        await expect(actionBar).toBeVisible();
        const selectedReplyBox = await replyLine.boundingBox();
        const actionBarBox = await actionBar.boundingBox();
        const movedNextOutgoingBox = await nextOutgoingLine.boundingBox();
        expect(actionBarBox!.y).toBeGreaterThanOrEqual(selectedReplyBox!.y);
        expect(actionBarBox!.y + actionBarBox!.height).toBeLessThanOrEqual(
            selectedReplyBox!.y + selectedReplyBox!.height,
        );
        expect(selectedReplyBox!.y + selectedReplyBox!.height).toBeLessThanOrEqual(movedNextOutgoingBox!.y);

        const widths = await page.evaluate(() => ({
            client: document.documentElement.clientWidth,
            scroll: document.documentElement.scrollWidth,
        }));
        expect(widths.scroll).toBe(widths.client);
    });
});
