export function formatHistory(messages) {
    return messages.map((message, i) => {
        if (i % 2 === 0){
            return `Human: ${message.text}`
        } else {
            return `AI: ${message.text}`
        }
    }).join('\n')
}
