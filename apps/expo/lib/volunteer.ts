import AsyncStorage from '@react-native-async-storage/async-storage';
import { Speaker } from './types';

const ACTIVE_SPEAKER_KEY = 'geysinan-active-speaker';

export function generateSpeakerId(): string {
  return `speaker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveActiveSpeaker(speaker: Speaker): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_SPEAKER_KEY, JSON.stringify(speaker));
}

export async function getActiveSpeaker(): Promise<Speaker | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_SPEAKER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Speaker;
  } catch {
    return null;
  }
}

export async function clearActiveSpeaker(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SPEAKER_KEY);
}

/** Picks the best supported audio mime type for MediaRecorder on web. */
export function pickRecordingMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

export interface UploadTicket {
  url: string;
  key: string;
}

/**
 * Requests a presigned upload URL from EXPO_PUBLIC_UPLOAD_URL, then PUTs the
 * blob directly to it. Mirrors the Lambda contract documented in the
 * volunteer ADR: GET ?speakerId=&wordId=&contentType= -> { url, key }.
 */
export async function uploadRecording(
  uploadUrl: string,
  speakerId: string,
  wordId: string,
  blob: Blob,
  contentType: string
): Promise<UploadTicket> {
  const params = new URLSearchParams({ speakerId, wordId, contentType });
  const ticketResponse = await fetch(`${uploadUrl}?${params.toString()}`);
  if (!ticketResponse.ok) {
    throw new Error(`Failed to get upload URL: ${ticketResponse.status}`);
  }
  const ticket = (await ticketResponse.json()) as UploadTicket;

  const putResponse = await fetch(ticket.url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!putResponse.ok) {
    throw new Error(`Upload failed: ${putResponse.status}`);
  }

  return ticket;
}
