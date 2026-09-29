class TorchService {
  private mediaStream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  public isTorchOn: boolean = false;

  public async toggleTorch(): Promise<{ success: boolean; state: boolean; error?: string }> {
    if (this.isTorchOn) {
      await this.turnOff();
      return { success: true, state: false };
    } else {
      const res = await this.turnOn();
      return { success: res, state: this.isTorchOn, error: res ? undefined : 'Torch API unsupported or permission denied' };
    }
  }

  public async turnOn(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      if (!this.track) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
        });
        this.mediaStream = stream;
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) {
          this.track = tracks[0];
        }
      }

      if (this.track) {
        // Check if torch constraint is supported
        const capabilities = (this.track.getCapabilities?.() as { torch?: boolean }) || {};
        if ('torch' in capabilities || true) {
          await (this.track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
            advanced: [{ torch: true }],
          });
          this.isTorchOn = true;
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn('Physical torch not supported or permission denied on this device', err);
      return false;
    }
  }

  public async turnOff(): Promise<void> {
    try {
      if (this.track) {
        await (this.track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: false }],
        });
        this.track.stop();
        this.track = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
        this.mediaStream = null;
      }
    } catch {}
    this.isTorchOn = false;
  }
}

export const torchService = new TorchService();
