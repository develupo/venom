import childProcess from 'child_process'
import { logger } from '../../../utils/logger'

export class AudioProcessor {
  protected process(fileStream, ffmpegOptions: string[], scope: string): any {
    const converter = childProcess.spawn('ffmpeg', ffmpegOptions)

    converter.on('error', (error) => {
      logger.error(
        `[AudioProcessor.${scope}] error=${JSON.stringify(error.stack)}`
      )
    })

    converter.on('exit', () => {
      logger.debug(`[AudioProcessor.${scope}] audio processing finished`)
    })

    // Piping file stream in
    fileStream.pipe(converter.stdin)

    // Piping file stream converted out
    return converter.stdout
  }

  toOGG(fileStream): any {
    return this.process(
      fileStream,
      [
        '-i',
        'pipe:0',
        '-ar',
        '16000',
        '-ab',
        '64000',
        '-acodec',
        'libopus',
        '-async',
        '1',
        '-f',
        'ogg',
        'pipe:1',
        '-avoid_negative_ts',
        'make_zero',
      ],
      'toOGG'
    )
  }

  toMP3(fileStream): any {
    return this.process(
      fileStream,
      [
        '-i',
        'pipe:0',
        '-ar',
        '44100',
        '-ab',
        '192k',
        '-acodec',
        'libmp3lame',
        '-f',
        'mp3',
        'pipe:1',
        '-avoid_negative_ts',
        'make_zero',
      ],
      'toMP3'
    )
  }

  toAAC(fileStream): any {
    return this.process(
      fileStream,
      [
        '-i',
        'pipe:0',
        '-ar',
        '16000',
        '-ab',
        '64000',
        '-acodec',
        'aac',
        '-async',
        '1',
        '-f',
        'adts',
        'pipe:1',
        '-avoid_negative_ts',
        'make_zero',
      ],
      'toAAC'
    )
  }
}

export const audioProcessor = new AudioProcessor()
