import { useEffect } from "react"

interface AiChatProps {
    model: string, 
    messages: string[],
    temperature: number
}

export const ChatAi = ( {model, messages, temperature}: AiChatProps )=> {
    useEffect(()=>{

    }, [model, messages, temperature])
    return(
        <div>

        </div>
    )
}