import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SplashFeature = ( {imageUrl, relUrl, headline, copy, userToggle }) => {
    const sessionUser = useSelector(state => state.session.user);

    return (
      <>
        <div className="feature-image"><img src={imageUrl} /></div>
        <div className="feature-headline"><NavLink className={ (userToggle && !sessionUser) ? "disabled" : "" } to={relUrl}>{headline}</NavLink></div>
        <div className="feature-copy">{copy}</div>
      </>
    )
  };

export default SplashFeature;
