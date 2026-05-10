import { useState } from 'react'
import { useTaskContext } from '../context/TaskContext'
import { useRole } from '../context/RoleContext'
import { useSounds } from '../utils/useSounds'
import PriorityPicker from './PriorityPicker'
import './TankBar.css'

export default function TankBar() {
    const { addTask } = useTaskContext()
    const { canWrite } = useRole()
    const { playSplash } = useSounds()
    const [input, setInput] = useState('')
    const [priority, setPriority] = useState('medium')

    async function handleRelease() {
        if (input.trim() === '') return
        try {
            await addTask(input.trim(), priority)
            playSplash()
            setInput('')
            setPriority('medium')
        } catch {
            /* TaskApiStatus shows tasksError */
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') handleRelease()
    }

    if (!canWrite) return null

    return (
        <div className="tank-bar">
            <input
                className="tank-input"
                type="text"
                placeholder="type your task here"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <PriorityPicker value={priority} onChange={setPriority} />
            <button className="tank-btn" onClick={handleRelease}>
                Release fish
            </button>
        </div>
    )
}