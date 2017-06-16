#!/usr/bin/python
import socket, threading, time, base64, hashlib, struct, binascii
import json
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
import uuid

class Signal(WebSocket):

	def handleMessage(self):
		global peers
		global peer_id_server 
		global rooms

		message = json.loads(self.data)
		peer_id_client = message["peerID"]

		if "sdp" or "candidate" in message:
			try:
				rooms[room_index]["peers"][peer_id_server].sendMessage(str(message))
			except Exception as e:
				print("exception" + e)
		elif "addPeer" in message:
			# peer_id_server+=1
			room_index = next(rooms.index(room) for room in rooms if rooms["roomID"] == message["roomID"])
			peer_id_server = len(rooms[room_index]["peers"])
			rooms[room_index]["peers"].append(peer_id_client) # for the time being I am appending the client id of peer to the index of that peer in the array on server
			rooms[room_index]["peers"][peer_id_server] = self
		elif "addRoom" in message:
			rooms.append({"roomID": message["roomID"], "peers": []})
		elif "verifyRoom" in message:
			room_index = next(rooms.index(room) for room in rooms if rooms["roomID"] == message["roomID"])
			if not room_index is None:
				self.sendMessage({"roomExists": "true"})
			else:
				self.sendMessage({"roomExists": "false"}) 

	# to be decided if the peer id should be generated on the client side or the server side
	def handleConnected(self):
		global next_peer
		global rooms

		self.sendMessage("You are connected to the virtual room")
		# self.sendMessage({"peerID": uuid.uuid4(), "generatePeerID": True})

	def handleClosed(self):
		rooms[room_index]["peers"].remove(rooms[room_index]["peers"].index(self))
