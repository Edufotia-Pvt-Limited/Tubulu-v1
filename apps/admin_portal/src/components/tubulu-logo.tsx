import Logo from '../assets/tubulu_logo.png';

export function TubuluLogo(): JSX.Element {
    return (
        <div className='absolute top-0 left-0'>
            <img alt='logo' src={Logo} />
        </div>
    )
}