const { Entity, Column, PrimaryGeneratedColumn } = require('typeorm');

class VideoEntity {
  constructor() {
    this.id = undefined; // 기본값 설정
    this.video_url = ''; // 기본값 설정
  }
}

// TypeORM에서 사용할 수 있도록 Entity와 Column을 별도로 설정
module.exports = {
  VideoEntity: Entity()(VideoEntity), // Entity 데코레이터 적용
  PrimaryGeneratedColumn,
  Column,
};
