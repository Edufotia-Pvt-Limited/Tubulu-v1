import 'dart:async';
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

class VoiceMessageBubble extends StatefulWidget {
  final String audioUrl;
  final bool isMe;
  final String? transcription;

  const VoiceMessageBubble({
    super.key,
    required this.audioUrl,
    required this.isMe,
    this.transcription,
  });

  @override
  State<VoiceMessageBubble> createState() => _VoiceMessageBubbleState();
}

class _VoiceMessageBubbleState extends State<VoiceMessageBubble> {
  late final AudioPlayer _player;
  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;
  StreamSubscription? _stateSub;
  StreamSubscription? _durSub;
  StreamSubscription? _posSub;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();

    // Set AudioContext to force speaker playback
    _player.setAudioContext(AudioContext(
      android: const AudioContextAndroid(
        isSpeakerphoneOn: true,
        stayAwake: true,
        contentType: AndroidContentType.music,
        usageType: AndroidUsageType.media,
        audioFocus: AndroidAudioFocus.gain,
      ),
      iOS: AudioContextIOS(
        category: AVAudioSessionCategory.playAndRecord,
        options: {
          AVAudioSessionOptions.defaultToSpeaker,
          AVAudioSessionOptions.mixWithOthers,
        },
      ),
    ));

    _stateSub = _player.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });

    _durSub = _player.onDurationChanged.listen((dur) {
      if (mounted) {
        setState(() {
          _duration = dur;
        });
      }
    });

    _posSub = _player.onPositionChanged.listen((pos) {
      if (mounted) {
        setState(() {
          _position = pos;
        });
      }
    });
  }

  @override
  void dispose() {
    _stateSub?.cancel();
    _durSub?.cancel();
    _posSub?.cancel();
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlay() async {
    try {
      if (_isPlaying) {
        await _player.pause();
      } else {
        String url = widget.audioUrl;
        if (!url.startsWith('http')) {
          // Fallback to local server path if relative
          url = 'http://localhost:3008$url';
        }
        await _player.play(UrlSource(url));
      }
    } catch (e) {
      debugPrint('Error playing voice bubble: $e');
    }
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes;
    final seconds = d.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final bubbleColor = widget.isMe
        ? theme.colorScheme.primary
        : (isDark ? Colors.grey[850]! : Colors.grey.shade100);

    final textColor = widget.isMe
        ? Colors.white
        : (isDark ? Colors.grey.shade100 : Colors.grey.shade800);

    final showTranscription = widget.transcription != null &&
        widget.transcription!.isNotEmpty &&
        widget.transcription != '🎤 Sending voice message...';

    return Align(
      alignment: widget.isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(widget.isMe ? 18 : 4),
            bottomRight: Radius.circular(widget.isMe ? 4 : 18),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: Icon(
                    _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                    color: textColor,
                    size: 32,
                  ),
                  onPressed: _togglePlay,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: _duration.inMilliseconds > 0
                              ? _position.inMilliseconds / _duration.inMilliseconds
                              : 0.0,
                          backgroundColor: textColor.withOpacity(0.2),
                          valueColor: AlwaysStoppedAnimation<Color>(textColor),
                          minHeight: 4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${_formatDuration(_position)} / ${_formatDuration(_duration)}',
                        style: TextStyle(color: textColor.withOpacity(0.7), fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (showTranscription) ...[
              const SizedBox(height: 8),
              Divider(color: textColor.withOpacity(0.2), height: 1),
              const SizedBox(height: 6),
              Text(
                widget.transcription!,
                style: TextStyle(color: textColor, fontSize: 14, fontStyle: FontStyle.italic),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
