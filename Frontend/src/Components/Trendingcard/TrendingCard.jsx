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
        console.log('[TrendingCard] fetching trending...')
        const data = await fetchTrending()
        console.log('[TrendingCard] fetched', data)
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            setItems(data)
          } else {
            setItems([])
          }
        }
      } catch (e) {
        console.error('[TrendingCard] fetch error', e)
        if (!cancelled) setError('Failed to load trending')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) return <div className='TrendingCardContent'>Loading...</div>
  if (error) return <div className='TrendingCardContent'>{error}</div>
  if (!items.length) return <div className='TrendingCardContent'>No trending tracks available</div>
  
  // Check if there are more than 9 songs
  if (items.length > 9) {
    return (
      <div className='TrendingCardContent' style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'red',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        Error: Maximum of 9 trending songs allowed. Found {items.length} songs.
      </div>
    );
  }

  return (
    <>
      <div className='TrendingCardContent'>
        {items.map((ele, id) => (
          <div key={id} onClick={() => {
            navigate(`/track/${ele._id}`, { state: { track: ele } })
          }} className="CardContent">
            <img src={ele.imgsrc} alt="" />
            <div className="CardContainerText">
              <h2>{ele.heading}</h2>
              <p>{ele.subheading}</p>
            </div>
            <span id="playbutton">
              <svg data-encore-id="icon" role="img" aria-hidden="true" className="e-9812-icon e-9812-baseline" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

export default TrendingCard