import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { lock, unlock } from 'proper-lockfile'

export type TransportConfigStdio = {
  type?: 'stdio'
  command: string;
  args?: string[];
  env?: Record<string, string> | string[];
}

export type TransportConfigSSE = {
  type: 'sse'
  url: string
}

export type TransportConfig = TransportConfigSSE | TransportConfigStdio
export interface ServerConfig {
  name: string;
  transport: TransportConfig;
}

export interface Config {
  servers: ServerConfig[];
}

const configPath = resolve(process.cwd(), 'config.json');

export const loadConfig = async (): Promise<Config> => {
  await lock(configPath, { retries: 10 })
  try {
    const fileContents = await readFile(configPath, 'utf-8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error loading config.json:', error);
    // Return empty config if file doesn't exist
    return { servers: [] };
  } finally {
    await unlock(configPath)
  }
}; 

export const saveConfig = async (config :Config): Promise<void> => {
  await lock(configPath, { retries: 10 })
  try {
    const fileContents = JSON.stringify(config, null, 2);
    await writeFile(configPath, fileContents);
  } catch (error) {
    console.error('Error saving config.json:', error);
  } finally {
    await unlock(configPath)
  }
}