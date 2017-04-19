// Here is the starting point for your application code.

// Small helpers you might want to keep
import './helpers/context_menu.js';
import './helpers/external_links.js';
import {Client} from 'ssh2';

// Set data stream
const set_stream = (conn, stream) => {
  stream.on('close', function (code, signal) {
    console.log('Stream :: close: ' + code + ', signal: ' + signal);
    conn.end();

    if (code === 0){
      document.querySelector('#result').innerHTML = 'Success! Restarted';
    }else{
      document.querySelector('#result').innerHTML = 'Restart Failed';
    }
  }).on('data', function (data) {
    console.log('STDOUT: ' + data);
  }).stderr.on('data', function (data) {
    console.log('STDERR: ' + data);
  });
};

// Connects to the server and executes a restart command
const connect_to_server = (conn_settings) => {
  let feedback = document.querySelector('#result');
  let conn = new Client();

  conn.on('connect', function () {
    console.log('Client :: connect');
    feedback.innerHTML = 'Connected';
  });

  conn.on('ready', function () {
    console.log('Client :: Ready');
    feedback.innerHTML = 'Restarting...';

    conn.exec('sudo /sbin/shutdown -r 0', function (err, stream) {
      if(err) throw err;
      set_stream(conn, stream);
    });
  }).connect(conn_settings);

  conn.on('error', function (err) {
    console.log('Connection :: error :: ' + err);
    feedback.innerHTML = "Could not connect";
  });

  conn.on('end', function () {
    console.log('Connection :: end');
  });

  conn.on('close', function () {
    console.log('Connection :: close');
  });
};

// Get input fields
const get_conn_settings = () => {
  let host_server = document.querySelector('#host').value;
  let port_number = document.querySelector('#port_number').value;
  let user = document.querySelector('#user').value;
  let pass = document.querySelector('#pass').value;
  document.querySelector('#result').innerHTML = host_server + port_number + user;
  return {host: host_server, port: port_number, username: user, password: pass};
};

const restart = () => {
  let conn_settings = get_conn_settings();
  connect_to_server(conn_settings);
};

document.querySelector('#restart_button').addEventListener('click', restart);
