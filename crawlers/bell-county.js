const fetch = require('node-fetch');
const dotenv = require('dotenv');
const {IncomingWebhook} = require('@slack/webhook');
const renderBellSlackMessage = require('../utils/renderBellSlackMessage');

dotenv.config();

const url = process.env.BELL_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);

const killeenURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices1@bellcountytx.onmicrosoft.com/bookings/service.svc/GetStaffBookability';
const templeURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices2@bellcountytx.onmicrosoft.com/bookings/service.svc/GetStaffBookability';
const killeenScheduleURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices1@bellcountytx.onmicrosoft.com/bookings/';
const templeScheduleURL = 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices2@bellcountytx.onmicrosoft.com/bookings/';

const killeenOptions = {
  'method': 'POST',
  'url': 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices1@bellcountytx.onmicrosoft.com/bookings/service.svc/GetStaffBookability',
  'headers': {
    'Connection': ' keep-alive',
    'Content-Length': ' 167',
    'User-Agent': ' Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
    'DNT': ' 1',
    'Content-Type': ' application/json; charset=UTF-8',
    'Accept': ' */*',
    'Origin': ' https://outlook.office365.com',
    'Sec-Fetch-Site': ' same-origin',
    'Sec-Fetch-Mode': ' cors',
    'Sec-Fetch-Dest': ' empty',
    'Accept-Encoding': ' gzip, deflate, br',
    'Accept-Language': ' en-US,en;q=0.9',
    'Cookie': ' ClientId=BE2D9ACA38F24040B4F9F9A3A37B3159; OIDC=1; OutlookSession=cf26724c32b8467e8997c525221825ff; ClientId=464769C1B88C47E0A6E746414E366D2D; OIDC=1',
  },
  'body': '{"StaffList":["0K2vfoBvR0Gxqhjo3CzMog=="],"Start":"2021-01-31T00:00:00","End":"2021-04-02T00:00:00","TimeZone":"America/Chicago","ServiceId":"06oo6bJVYUmbCVQMl9fGmA2"}',

};

const templeOptions = {
  'method': 'POST',
  'url': 'https://outlook.office365.com/owa/calendar/BellCountyTechnologyServices2@bellcountytx.onmicrosoft.com/bookings/service.svc/GetStaffBookability',
  'headers': {
    'Connection': ' keep-alive',
    'Content-Length': ' 167',
    'User-Agent': ' Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36',
    'DNT': ' 1',
    'Content-Type': ' application/json; charset=UTF-8',
    'Accept': ' */*',
    'Origin': ' https://outlook.office365.com',
    'Sec-Fetch-Site': ' same-origin',
    'Sec-Fetch-Mode': ' cors',
    'Sec-Fetch-Dest': ' empty',
    'Accept-Encoding': ' gzip, deflate, br',
    'Accept-Language': ' en-US,en;q=0.9',
    'Cookie': ' ClientId=BE2D9ACA38F24040B4F9F9A3A37B3159; OIDC=1; OutlookSession=cf26724c32b8467e8997c525221825ff; ClientId=464769C1B88C47E0A6E746414E366D2D; OIDC=1; OutlookSession=b603e3585022473485c04aca4f8af0a2',
  },
  'body': '{"StaffList":["oRNfXWZlGUOu7ts+5Z8G6A=="],"Start":"2021-02-02T00:00:00","End":"2021-04-02T00:00:00","TimeZone":"America/Chicago","ServiceId":"Am-gd-n3Fk-tWqxY7Ey1hQ2"}',

};

const checkBellCounty = async () => {
  console.log('Checking Bell County for vaccines...');
  Promise.all([
    fetch(killeenURL, killeenOptions),
    fetch(templeURL, templeOptions),
  ]).then((responses) => {
    return Promise.allSettled(responses.map((response) => response.json()));
  }).then(async (data) => {
    const [killeen, temple] = data;
    const killeenBookableItems = killeen.value.StaffBookabilities[0].BookableItems;
    const templeBookableItems = temple.value.StaffBookabilities[0].BookableItems;

    if (killeenBookableItems.length > 0) {
      const slackMessage = renderBellSlackMessage(killeenScheduleURL, 'Killeen');
      await webhook.send(slackMessage);
    }
    if (templeBookableItems.length > 0) {
      const slackMessage = renderBellSlackMessage(templeScheduleURL, 'Temple');
      await webhook.send(slackMessage);
    }
  }).catch((error) => {
    console.log(error);
  });
};

module.exports = checkBellCounty;
