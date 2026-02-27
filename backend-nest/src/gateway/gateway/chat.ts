import { useEffect, useState} from 'react'
import { MesasgePanel } from '../components/messages/MessagePanel'
import { MessageEventPayload, MessageType } from '../utils/types'
import { useParams } from 'react-router-dom'
import { socket } from '../utils/context/SocketContext'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store'
import { fetchMessagesThunk } from '../store/messageSlice'

export const ConverSationChannelPage = () => {
	const { id } = useParams()
	const dispatch = useDispatch<AppDispatch>()
	const [message, setMessage] = useState();
}