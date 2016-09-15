var Botkit = require('botkit')
var http = require('http')

var options = {
  hostname: 'https://www.baas.kinvey.com',
  path: '/rpc/kid_Zk0NE5LXpg/custom/confirmation',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
      'Authorization' : 'Basic a2lkX1prME5FNUxYcGc6YjZmMjU3NjU0YmIwNDY4YzllZTI1MjgyNTNhMmI3NWI='
  }
};

var kinveyRequest = function(mode, id, date)
{
  var req = http.request(options.path + '?mode='+mode, null);

  req.write('{' + mode + ': ' + id + ', date: ' + date + '}');
  req.end();
};

var PORT = process.env.PORT || 8080

var TOKEN = process.env.SLACK_TOKEN

var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})
var bot = controller.spawn({token: TOKEN}).startRTM()

bot.api.team.info({}, function(err, res){

  if(err){
    return console.error(err)
  }
  controller.storage.teams.save({id: res.team.id}, (err) => {
    if(err){
      console.error(err)
    }
  })

})

controller.setupWebserver(PORT, function (err, webserver) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  //webserver.use(logger('tiny'))
  // Setup our slash command webhook endpoints
  controller.createWebhookEndpoints(webserver)
})

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['helloo', 'hie'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'

  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})



controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorryyyy <@' + message.user + '>, I don\'t understand. \n')
})


controller.on('interactive_message_callback', function(bot, message) {

    // check message.actions and message.callback_id to see what action to take...

    var message_callback = message.callback_id.split('-');


if(message.actions == "si")
{
  bot.replyInteractive(message, {
      text: 'Gracias por confirmar:thumbsup:'
  });

//  kinveyRequest("present", message_callback[0], message_callback[1]);

}
else{
  bot.replyInteractive(message, {
      text: 'Gracias por notificarnos :thumbsup: Se buscara un *reemplazo* ' + message.actions.name
  });
//kinveyRequest("abscent", message_callback[0], message_callback[1]);

}




});
