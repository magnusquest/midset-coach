"use client";
import React, { useState, useEffect } from 'react';

/**
 * Recursively finds all .slp files in a directory handle
 */
async function findSlpFilesRecursively(
  dirHandle: any, // FileSystemDirectoryHandle
  path = ''
): Promise<File[]> {
  const slpFiles: File[] = [];

  try {
    // Use entries() instead of values() for better TypeScript compatibility
    for await (const [name, entry] of dirHandle.entries()) {
      const entryPath = path ? `${path}/${name}` : name;

      if (entry.kind === 'file' && name.endsWith('.slp')) {
        try {
          const file = await entry.getFile();
          // Create a new File with the relative path as the name for reference
          const fileWithPath = new File([file], entryPath, { type: file.type });
          slpFiles.push(fileWithPath);
        } catch (err) {
          console.warn(`Failed to read file ${entryPath}:`, err);
        }
      } else if (entry.kind === 'directory') {
        // Recursively search subdirectories
        try {
          const subDirFiles = await findSlpFilesRecursively(entry, entryPath);
          slpFiles.push(...subDirFiles);
        } catch (err) {
          console.warn(`Failed to read directory ${entryPath}:`, err);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${path}:`, err);
  }

  return slpFiles;
}

export default function FileDropzone() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [watching, setWatching] = useState(false);

  // Check if File System Access API is supported (client-side only)
  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'showDirectoryPicker' in window);
    checkWatchStatus();
  }, []);

  async function checkWatchStatus() {
    try {
      const res = await fetch('/api/watch/status');
      const data = await res.json();
      if (data.path) {
        setSelectedFolder(data.path);
        setWatching(data.watching);
      }
    } catch (error) {
      console.error('Failed to check watch status:', error);
    }
  }

  const handleSelectFolder = async () => {
    // Check if File System Access API is supported
    if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) {
      alert(
        'Folder selection is not supported in this browser. Please use Chrome, Edge, or another Chromium-based browser.'
      );
      return;
    }

    try {
      setIsLoading(true);
      
      // Show directory picker
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
      });

      setSelectedFolder(dirHandle.name);

      // Recursively find all .slp files
      const slpFiles = await findSlpFilesRecursively(dirHandle);
      setFileCount(slpFiles.length);

      if (slpFiles.length === 0) {
        alert('No .slp files found in the selected folder.');
        setIsLoading(false);
        return;
      }

      // Upload all files
      const form = new FormData();
      for (const file of slpFiles) {
        form.append('file', file);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();

      if (result.ok) {
        // Store folder path and start watching
        const folderPath = dirHandle.name;
        setSelectedFolder(folderPath);
        
        // Start watching for new files
        try {
          const watchRes = await fetch('/api/watch/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: folderPath }),
          });
          const watchData = await watchRes.json();
          if (watchData.ok) {
            setWatching(true);
          }
        } catch (watchErr) {
          console.error('Failed to start watching:', watchErr);
        }
        
        alert(`Successfully imported ${result.results.length} game(s)!`);
        // Refresh the page to show new games
        window.location.reload();
      } else {
        alert('Failed to import games. Please try again.');
      }
    } catch (err: any) {
      // User cancelled the dialog
      if (err.name === 'AbortError') {
        // User cancelled, do nothing
      } else {
        console.error('Error selecting folder:', err);
        alert(`Error: ${err.message || 'Failed to import games'}`);
      }
    } finally {
      setIsLoading(false);
      setSelectedFolder(null);
      setFileCount(null);
    }
  };

  // Don't show if folder is already selected
  if (selectedFolder && !isLoading) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
        background: '#24283b',
        border: '1px solid #3b4261',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#9ece6a', fontSize: 14, fontWeight: 600 }}>
            Watching folder: {selectedFolder}
          </p>
          {watching && (
            <p style={{ margin: '4px 0 0 0', color: '#7aa2f7', fontSize: 12 }}>
              Auto-loading new games...
            </p>
          )}
        </div>
        <button
          onClick={async () => {
            try {
              await fetch('/api/watch/stop', { method: 'POST' });
              setSelectedFolder(null);
              setWatching(false);
            } catch (error) {
              console.error('Failed to stop watching:', error);
            }
          }}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            background: '#24283b',
            color: '#c0caf5',
            border: '1px solid #3b4261',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Change Folder
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
      border: '2px dashed #3b4261',
      padding: 28,
      borderRadius: 16,
      background: '#24283b',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <button
        onClick={handleSelectFolder}
        disabled={isLoading}
        style={{
          padding: '14px 32px',
          fontSize: 16,
          fontWeight: 700,
            background: isLoading 
            ? '#565f89'
            : '#7aa2f7',
          color: isLoading ? '#565f89' : '#1a1b26',
          border: 'none',
          borderRadius: 12,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: 16,
            boxShadow: isLoading ? 'none' : '0 4px 12px rgba(122, 162, 247, 0.3)',
          transition: 'all 0.3s ease',
          transform: isLoading ? 'none' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(122, 162, 247, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(122, 162, 247, 0.3)';
          }
        }}
      >
        {isLoading ? 'Importing...' : '📁 Select Slippi Folder'}
      </button>
      
      {isLoading && fileCount !== null && (
        <p style={{ margin: '8px 0 0 0', color: '#c0caf5', fontSize: 15, fontWeight: 500 }}>
          Found {fileCount} .slp file{fileCount !== 1 ? 's' : ''}...
        </p>
      )}
      
      {!isLoading && (
        <p style={{ margin: '8px 0 0 0', color: '#a9b1d6', fontSize: 14, fontWeight: 500 }}>
          Click to browse and import all .slp files from a folder
        </p>
      )}
      
      {isSupported === false && (
        <p style={{ margin: '12px 0 0 0', color: '#f7768e', fontSize: 12, fontWeight: 500, padding: '8px 12px', background: '#1a1b26', borderRadius: 8, border: '1px solid #f7768e' }}>
          ⚠ Folder selection requires a Chromium-based browser (Chrome, Edge, etc.)
        </p>
      )}
    </div>
  );
}

