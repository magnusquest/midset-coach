import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Common Slippi executable locations
 */
const SLIPPI_PATHS = {
  darwin: [
    '/Applications/Slippi.app/Contents/MacOS/Slippi',
    path.join(os.homedir(), 'Applications/Slippi.app/Contents/MacOS/Slippi'),
  ],
  win32: [
    'C:\\Program Files\\Slippi\\Slippi.exe',
    'C:\\Program Files (x86)\\Slippi\\Slippi.exe',
    path.join(os.homedir(), 'AppData\\Local\\Programs\\Slippi\\Slippi.exe'),
  ],
  linux: [
    '/usr/bin/slippi',
    '/usr/local/bin/slippi',
    path.join(os.homedir(), '.local/bin/slippi'),
  ],
};

/**
 * Finds the Slippi executable path
 */
function findSlippiExecutable(): string | null {
  const platform = os.platform();
  const paths = SLIPPI_PATHS[platform as keyof typeof SLIPPI_PATHS] || [];
  
  for (const exePath of paths) {
    if (fs.existsSync(exePath)) {
      return exePath;
    }
  }
  
  return null;
}

/**
 * Launches a replay file using protocol handler
 */
export async function launchReplayProtocol(filePath: string): Promise<boolean> {
  try {
    const protocol = `slippi://${encodeURIComponent(filePath)}`;
    
    // Try to open using protocol handler
    const platform = os.platform();
    if (platform === 'darwin') {
      await execAsync(`open "${protocol}"`);
    } else if (platform === 'win32') {
      await execAsync(`start "${protocol}"`);
    } else {
      // Linux - try xdg-open
      await execAsync(`xdg-open "${protocol}"`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to launch via protocol:', error);
    return false;
  }
}

/**
 * Launches a replay file using command execution
 */
export async function launchReplayCommand(filePath: string): Promise<boolean> {
  try {
    const slippiExe = findSlippiExecutable();
    
    if (!slippiExe) {
      throw new Error('Slippi executable not found');
    }
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Replay file not found: ${filePath}`);
    }
    
    const platform = os.platform();
    let command: string;
    
    if (platform === 'win32') {
      command = `"${slippiExe}" "${filePath}"`;
    } else {
      command = `"${slippiExe}" "${filePath}"`;
    }
    
    await execAsync(command);
    return true;
  } catch (error) {
    console.error('Failed to launch via command:', error);
    return false;
  }
}

/**
 * Launches a replay file using the configured method
 */
export async function launchReplay(filePath: string, method: 'protocol' | 'command' | 'both' = 'both'): Promise<boolean> {
  if (method === 'protocol') {
    return await launchReplayProtocol(filePath);
  } else if (method === 'command') {
    return await launchReplayCommand(filePath);
  } else {
    // Try protocol first, fallback to command
    const protocolSuccess = await launchReplayProtocol(filePath);
    if (protocolSuccess) {
      return true;
    }
    return await launchReplayCommand(filePath);
  }
}

