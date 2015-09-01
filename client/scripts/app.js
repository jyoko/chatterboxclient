var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  // time is initial time to try reconnecting in ms
  time: 1000,
  init: function() {
    this.fetch();
    $('#sendMessage').on('click', function() {
      var user = $('#username').val();
      var text = $('#chatMessage').val();
      app.send({username: user,text: text});
    });
  },
  send: function (message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        console.log('Message sent');
      },
      error: function(data) {
        console.log('Error sending');
      }
    });
  },
  fetch: function() {
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function(data) {
        if (app.time>1000) app.time=1000;
        var chat = d3.select('#chats').selectAll('div')
                    .data(data.results, function(d) { return d.objectId; });
        chat.enter()
          .insert('div')
          .attr('id',function(d) { return d.objectId; })
          .each(function(d) {
            app.addMessage({username:d.username,text:d.text,roomname:d.roomname},d.objectId);
          });
        chat.exit()
          .remove();

        app.poll();
      },
      error: function(data) {
        console.log('Error fetching, trying again in '+(app.time/1000)+' secs');
        setTimeout(function(){app.fetch();},app.time);
        app.time*=2;
      }
    });
  },
  addMessage: function (message,objectId) {
    objectId = objectId || null;
    var el = document.createElement('span');
    $(el).addClass('username').text(message.username+' : ');
    $('#'+objectId).append(el);
    el = document.createElement('span');
    $(el).addClass('message').text(message.text);
    $('#'+objectId).append(el);
  },
  clearMessages: function () {
    $('#chats').html('');
  },
  addRoom: function (roomName) {
    var el = document.createElement('div');
    $(el).text(roomName).appendTo('#roomSelect');
  },
  poll: function() {
    setTimeout(function() {
      app.fetch();
    },1500);
  }
};