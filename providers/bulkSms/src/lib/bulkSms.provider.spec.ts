import { BulkSmsSmsProvider } from './bulkSms.provider';

test('should trigger bulkSms library correctly', async () => {
  const response1 = await fetch(
    'http://bulksmsoffers.com/',
    // Bulksms API url will be put here so that we can send sms to our clients (Ex - 'http://login.bulksmsoffers.com/'),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response1.json();

  return {
    id: 'yymd',
    date: '20221027',
  };
});
