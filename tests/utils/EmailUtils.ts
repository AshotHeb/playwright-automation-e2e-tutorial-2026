type Inbox = {
  id: string;
  emailAddress: string;
};

type EmailMessage = {
  id: string;
  subject: string;
  body: string;
  text: string;
};

const BASE_URL = "https://api.mail.tm";
const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 30000;

export class EmailUtils {
  // Maps an inbox's account id to the auth token needed to read its mail.
  private tokens: Map<string, string> = new Map();

  public async createInbox(): Promise<Inbox> {
    const domain = await this.getAvailableDomain();
    const address = this.generateAddress(domain);
    const password = this.generatePassword();

    const account = await this.createAccount(address, password);
    const token = await this.requestAuthToken(address, password);
    this.tokens.set(account.id, token);

    return { id: account.id, emailAddress: address };
  }

  public async waitForLatestEmail(
    inboxId: string,
    timeoutMs = DEFAULT_TIMEOUT_MS
  ): Promise<EmailMessage> {
    const token = this.getTokenOrThrow(inboxId);
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const latestMessageId = await this.getLatestMessageId(token);
      if (latestMessageId) {
        return this.fetchMessage(latestMessageId, token);
      }
      await this.sleep(POLL_INTERVAL_MS);
    }

    throw new Error(
      `No email received in inbox ${inboxId} within ${timeoutMs}ms`
    );
  }

  private async getAvailableDomain(): Promise<string> {
    const res = await fetch(`${BASE_URL}/domains`);
    const data = await res.json();
    return data["hydra:member"][0].domain;
  }

  private generateAddress(domain: string): string {
    return `test${Date.now()}${Math.floor(Math.random() * 1000)}@${domain}`;
  }

  private generatePassword(): string {
    return `Pw${Math.random().toString(36).slice(2)}!`;
  }

  private async createAccount(
    address: string,
    password: string
  ): Promise<{ id: string }> {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });
    if (!res.ok) {
      throw new Error(
        `Failed to create inbox: ${res.status} ${await res.text()}`
      );
    }
    return res.json();
  }

  private async requestAuthToken(
    address: string,
    password: string
  ): Promise<string> {
    const res = await fetch(`${BASE_URL}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });
    const data = await res.json();
    return data.token;
  }

  private getTokenOrThrow(inboxId: string): string {
    const token = this.tokens.get(inboxId);
    if (!token)
      throw new Error(
        `No token found for inbox ${inboxId}. Did you call createInbox()?`
      );
    return token;
  }

  private async getLatestMessageId(token: string): Promise<string | undefined> {
    const res = await fetch(`${BASE_URL}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const messages = data["hydra:member"];
    return messages?.[0]?.id;
  }

  private async fetchMessage(
    messageId: string,
    token: string
  ): Promise<EmailMessage> {
    const res = await fetch(`${BASE_URL}/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const full = await res.json();
    return {
      id: full.id,
      subject: full.subject,
      body: full.html?.[0] ?? full.text,
      text: full.text,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
