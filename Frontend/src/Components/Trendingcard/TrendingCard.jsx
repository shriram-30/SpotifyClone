import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './trendingcard.css'
import { fetchTrending } from '../../Config/config'

const TrendingCard = ({ setcurrentpage, setcurrentEle }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchTrending()
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            // Limit to 9 items if there are more
            const limitedItems = data.slice(0, 9)
            setItems(limitedItems)
          } else {
            setItems([])
          }
        }
      } catch (e) {
        console.error('Error fetching trending songs:', e)
        if (!cancelled) setError('Failed to load trending songs')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className='TrendingCardContent'>Loading trending songs...</div>
  if (error) return <div className='TrendingCardContent error-message'>{error}</div>
  if (!items.length) return <div className='TrendingCardContent'>No trending tracks available</div>

  return (
    <div className='TrendingCardContent'>
      {items.map((song) => (
        <div 
          key={song._id} 
          className="CardContent"
          onClick={() => {
            if (setcurrentpage) setcurrentpage('home')
            if (setcurrentEle) setcurrentEle(song)
            navigate(`/track/${song._id}`, { state: { track: song } })
          }}
        >
          <img src={song.imgsrc} alt={song.heading} className="song-cover" />
          <div className="CardContainerText">
            <h3 className="song-title">{song.heading}</h3>
            <p className="song-artist">{song.subheading}</p>
          </div>
          <div className="play-button">
            <svg viewBox="0 0 24 24" className="play-icon" width="24" height="24" fill="white">
              <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TrendingCard