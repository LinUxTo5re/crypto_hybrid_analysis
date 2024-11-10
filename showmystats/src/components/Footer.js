import LoadingIndicator from '../static/js/LoadingIndicator';

function Footer() {
    const title  = "hello footer";
    return (
<>
<LoadingIndicator msg = {"Welcome to TRADE ❤️"} isCircularLoadUsing= {false} isParentSpaceAllowed={false} color={'black'}/>         
</>
    );
}

export default Footer;
