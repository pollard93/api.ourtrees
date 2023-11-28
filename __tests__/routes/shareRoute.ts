import axios from 'axios';
import { getMobileClientUrl } from '../../src/utils/functions';
import '../../global-variables';

test('should succeed with image', async () => {
  const user = await global.config.utils.createUser({
    profilePicture: {
      create: {
        path: 'public/users/user-id/cover-image.jpeg',
        mime: '',
        authorId: (await global.config.utils.createUser()).user.id,
      },
    },
  });

  const res = await axios.get(`${global.config.baseUrl}/share/user/${user.user.id}`);

  expect(res.data.includes(`<title>${user.user.name}</title>`)).toBeTruthy();
  expect(res.data.includes(`<meta name="description" content="${user.user.name}" />`)).toBeTruthy();
  expect(
    res.data.includes(`window.location.href = '${getMobileClientUrl()}user/${user.user.id}'`),
  ).toBeTruthy();
  expect(res.status).toEqual(200);
});

test('should succeed without image (incase of any failures)', async () => {
  const user = await global.config.utils.createUser();
  const res = await axios.get(`${global.config.baseUrl}/share/user/${user.user.id}`);

  expect(res.data.includes(`<title>${user.user.name}</title>`)).toBeTruthy();
  expect(res.data.includes(`<meta name="description" content="${user.user.name}" />`)).toBeTruthy();
  expect(
    res.data.includes(`window.location.href = '${getMobileClientUrl()}user/${user.user.id}'`),
  ).toBeTruthy();
  expect(res.status).toEqual(200);
});

test('should fail with unknown user id', async () => {
  try {
    await axios.get(`${global.config.baseUrl}/share/user/unknown-id`);
    throw new Error();
  } catch (e) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(e.response.status).toEqual(400);
  }
});

test('should fail with unknown type', async () => {
  try {
    await axios.get(`${global.config.baseUrl}/share/unknown-type/unknown-id`);
    throw new Error();
  } catch (e) {
    // eslint-disable-next-line jest/no-conditional-expect, jest/no-try-expect
    expect(e.response.status).toEqual(400);
  }
});
