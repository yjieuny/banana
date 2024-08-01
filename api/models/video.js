const { EntitySchema } = require('typeorm');

class VideoEntity {
  constructor() {
    this.id = undefined;
    this.video_url = '';
    this.orientation = 'unknown';
  }
}

module.exports = new EntitySchema({
  name: 'VideoEntity',
  target: VideoEntity,
  tableName: 'videos',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    video_url: {
      type: 'varchar',
      length: 2048,
    },
    orientation: {
      type: 'varchar',
      length: 20,
    },
  },
});
