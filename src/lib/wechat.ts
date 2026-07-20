// WeChat Work (企业微信) group bot webhook — https://developer.work.weixin.qq.com/document/path/91770
export async function pushToWeChat(webhookUrl: string, content: string): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msgtype: "text",
        text: { content: content.slice(0, 2000) },
      }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.errcode === 0;
  } catch (err) {
    console.error("WeChat Work push failed:", err);
    return false;
  }
}
