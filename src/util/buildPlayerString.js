export default function buildPlayerString(player) {
    if (!player) return ''
    const { username, elo } = player || {}
    return `${username} (${elo})`
}