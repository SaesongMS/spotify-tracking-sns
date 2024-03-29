import { A } from "@solidjs/router"; 

function NavbarButton(props){
    const { image, destination, ...others } = props;
    return(
    <A href={destination}  class="relative flex items-center justify-center h-16 w-16 mt-2 mb-2 mx-auto shadow-lg bg-[#2b2d31] rounded-[30px] hover:bg-[#64748b] hover:rounded-xl transition-all duration-200 ease-linear cursor-pointer">
        <img src={image} />
    </A>
    )
}

export default NavbarButton;