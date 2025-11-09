import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { KickAccount } from "../lib";
import { currentPath } from "../fileLoader";

export class AccountManager {
  private accounts: KickAccount[] = [];
  private cooldowns: Map<string, number> = new Map();
  private readonly cooldownTime = 5 * 60 * 1000;
  private readonly accountsPath: string;

  constructor() {
    this.accountsPath = join(currentPath(), "data", "accounts.json");
    this.loadAccounts();
  }

  loadAccounts(): void {
    try {
      if (existsSync(this.accountsPath)) {
        const data = readFileSync(this.accountsPath, "utf-8");
        const parsed = JSON.parse(data);
        this.accounts = Array.isArray(parsed) ? parsed : [];
        console.log(`Loaded ${this.accounts.length} Kick accounts`);
      } else {
        console.log("No accounts.json found, starting with empty account pool");
        this.accounts = [];
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      this.accounts = [];
    }
  }

  getAvailableAccount(): KickAccount | null {
    const now = Date.now();

    const available = this.accounts.find((acc) => {
      if (!acc.isActive) return false;

      const lastUsed = this.cooldowns.get(acc.username);
      if (lastUsed && now - lastUsed < this.cooldownTime) {
        return false;
      }

      return true;
    });

    if (available) {
      this.cooldowns.set(available.username, now);
      available.lastUsed = now;
    }

    return available || null;
  }

  releaseAccount(username: string): void {
    this.cooldowns.delete(username);
  }

  saveAccounts(): void {
    try {
      const data = JSON.stringify(this.accounts, null, 2);
      writeFileSync(this.accountsPath, data, "utf-8");
      console.log("Accounts saved successfully");
    } catch (error) {
      console.error("Error saving accounts:", error);
    }
  }

  getActiveAccountCount(): number {
    return this.accounts.filter((acc) => acc.isActive).length;
  }

  getAllAccounts(): KickAccount[] {
    return this.accounts;
  }

  addAccount(account: KickAccount): void {
    this.accounts.push(account);
    this.saveAccounts();
  }

  updateAccount(username: string, updates: Partial<KickAccount>): boolean {
    const index = this.accounts.findIndex((acc) => acc.username === username);
    if (index !== -1) {
      this.accounts[index] = { ...this.accounts[index], ...updates };
      this.saveAccounts();
      return true;
    }
    return false;
  }

  removeAccount(username: string): boolean {
    const initialLength = this.accounts.length;
    this.accounts = this.accounts.filter((acc) => acc.username !== username);
    if (this.accounts.length < initialLength) {
      this.saveAccounts();
      return true;
    }
    return false;
  }
}
