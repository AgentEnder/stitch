
export interface YyData {
  name: string,
  resourceType: string,
  tags: string[],
  /** Parent folder */
  parent: {
    /** Folder's 'name' field */
    name: string,
    /** Folder's 'folderPath' field */
    path: string,
  },
  resourceVersion: "1.0" // constant
}

enum SoundChannel {
  Mono,
  Stereo,
  ThreeD
}

enum SoundCompression {
  Uncompressed,
  Compressed,
  UncompressedOnLoad,
  CompressedStreamed,
}

enum SoundBitDepth {
  Bit8,
  Bit16
}

export interface YySound extends YyData {
  /** Default 0. Compression level */
  compression: SoundCompression,
  /** Default 1. Number from 0-1 */
  volume: number,
  preload: boolean,
  /** Default 128. Starting from 8, increments of 8, max of 512 */
  bitRate: number,
  /** Default 44100 */
  sampleRate: 5512 | 11025 | 22050 | 32000 | 44100 | 48000,
  /** Mono/stereo/3d */
  type: SoundChannel,
  /** Default 1 */
  bitDepth: SoundBitDepth,
  audioGroupId: {
    name: string,
    path: string,
  },
  /** `${name}.${ext} (e.g. mySound) */
  soundFile: string,
  // duration: number, // This can be safely deleted, which is great since we don't want to compute it
  resourceType: "GMSound",
}

export interface YySprite extends YyData {
  // "bboxMode": 0,
  // "collisionKind": 1,
  // "type": 0,
  // "origin": 4,
  // "preMultiplyAlpha": false,
  // "edgeFiltering": false,
  // "collisionTolerance": 0,
  // "swfPrecision": 2.525,
  // "bbox_left": 9,
  // "bbox_right": 56,
  // "bbox_top": 0,
  // "bbox_bottom": 59,
  // "HTile": false,
  // "VTile": false,
  // "For3D": false,
  // "width": 64,
  // "height": 64,
  // "textureGroupId": {
  //   "name": "the_texture_group",
  //   "path": "texturegroups/the_texture_group",
  // },
  // "swatchColours": null,
  // "gridX": 0,
  // "gridY": 0,
  // "frames": [
  //   {"compositeImage":{"FrameId":{"name":"98c41232-eb8d-41fc-a6d9-156eafb4d651","path":"sprites/sprite/sprite.yy",},"LayerId":null,"resourceVersion":"1.0","name":"","tags":[],"resourceType":"GMSpriteBitmap",},"images":[
  //       {"FrameId":{"name":"98c41232-eb8d-41fc-a6d9-156eafb4d651","path":"sprites/sprite/sprite.yy",},"LayerId":{"name":"471a5749-b8f8-4630-856a-bdce7ff709b2","path":"sprites/sprite/sprite.yy",},"resourceVersion":"1.0","name":"","tags":[],"resourceType":"GMSpriteBitmap",},
  //     ],"parent":{"name":"sprite","path":"sprites/sprite/sprite.yy",},"resourceVersion":"1.0","name":"98c41232-eb8d-41fc-a6d9-156eafb4d651","tags":[],"resourceType":"GMSpriteFrame",},
  //   {"compositeImage":{"FrameId":{"name":"34126976-a5d5-4f2a-988b-384c47e1f81e","path":"sprites/sprite/sprite.yy",},"LayerId":null,"resourceVersion":"1.0","name":"","tags":[],"resourceType":"GMSpriteBitmap",},"images":[
  //       {"FrameId":{"name":"34126976-a5d5-4f2a-988b-384c47e1f81e","path":"sprites/sprite/sprite.yy",},"LayerId":{"name":"471a5749-b8f8-4630-856a-bdce7ff709b2","path":"sprites/sprite/sprite.yy",},"resourceVersion":"1.0","name":"","tags":[],"resourceType":"GMSpriteBitmap",},
  //     ],"parent":{"name":"sprite","path":"sprites/sprite/sprite.yy",},"resourceVersion":"1.0","name":"34126976-a5d5-4f2a-988b-384c47e1f81e","tags":[],"resourceType":"GMSpriteFrame",},
  // ],
  // "sequence": {
  //   "spriteId": {"name":"sprite","path":"sprites/sprite/sprite.yy",},
  //   "timeUnits": 1,
  //   "playback": 1,
  //   "playbackSpeed": 30.0,
  //   "playbackSpeedType": 1,
  //   "autoRecord": true,
  //   "volume": 1.0,
  //   "length": 2.0,
  //   "events": {"Keyframes":[],"resourceVersion":"1.0","resourceType":"KeyframeStore<MessageEventKeyframe>",},
  //   "moments": {"Keyframes":[],"resourceVersion":"1.0","resourceType":"KeyframeStore<MomentsEventKeyframe>",},
  //   "tracks": [
  //     {"name":"frames","spriteId":null,"keyframes":{"Keyframes":[
  //           {"id":"c49cf451-e332-4284-88ad-605b9b54c139","Key":0.0,"Length":1.0,"Stretch":false,"Disabled":false,"IsCreationKey":false,"Channels":{"0":{"Id":{"name":"98c41232-eb8d-41fc-a6d9-156eafb4d651","path":"sprites/sprite/sprite.yy",},"resourceVersion":"1.0","resourceType":"SpriteFrameKeyframe",},},"resourceVersion":"1.0","resourceType":"Keyframe<SpriteFrameKeyframe>",},
  //           {"id":"ea220aa2-106b-4e02-a07f-286e4079a42b","Key":1.0,"Length":1.0,"Stretch":false,"Disabled":false,"IsCreationKey":false,"Channels":{"0":{"Id":{"name":"34126976-a5d5-4f2a-988b-384c47e1f81e","path":"sprites/sprite/sprite.yy",},"resourceVersion":"1.0","resourceType":"SpriteFrameKeyframe",},},"resourceVersion":"1.0","resourceType":"Keyframe<SpriteFrameKeyframe>",},
  //         ],"resourceVersion":"1.0","resourceType":"KeyframeStore<SpriteFrameKeyframe>",},"trackColour":0,"inheritsTrackColour":true,"builtinName":0,"traits":0,"interpolation":1,"tracks":[],"events":[],"modifiers":[],"isCreationTrack":false,"resourceVersion":"1.0","tags":[],"resourceType":"GMSpriteFramesTrack",},
  //   ],
  //   "visibleRange": null,
  //   "lockOrigin": false,
  //   "showBackdrop": true,
  //   "showBackdropImage": false,
  //   "backdropImagePath": "",
  //   "backdropImageOpacity": 0.5,
  //   "backdropWidth": 1366,
  //   "backdropHeight": 768,
  //   "backdropXOffset": 0.0,
  //   "backdropYOffset": 0.0,
  //   "xorigin": 32,
  //   "yorigin": 32,
  //   "eventToFunction": {},
  //   "eventStubScript": null,
  //   "parent": {"name":"sprite","path":"sprites/sprite/sprite.yy",},
  //   "resourceVersion": "1.3",
  //   "name": "sprite",
  //   "tags": [],
  //   "resourceType": "GMSequence",
  // },
  // "layers": [
  //   {"visible":true,"isLocked":false,"blendMode":0,"opacity":100.0,"displayName":"default","resourceVersion":"1.0","name":"471a5749-b8f8-4630-856a-bdce7ff709b2","tags":[],"resourceType":"GMImageLayer",},
  // ],
  "resourceType": "GMSprite"
}