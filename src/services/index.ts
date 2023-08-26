import { S3Event } from 'aws-lambda';

export async function handler(event: S3Event): Promise<void> {
  // event.Records.forEach((record: any) => {
  //   console.log('Event Name: %s', record.eventName);
  //   console.log('S3 Request: %j', record.s3);
  // });
}
