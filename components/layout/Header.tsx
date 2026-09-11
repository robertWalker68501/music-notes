import Navbar from '../navigation/Navbar';

const Header = () => {
  return (
    <header className='sticky top-0 border-b border-border py-4 backdrop-blur-2xl dark:bg-zinc-900/30'>
      <div className='page-wrapper'>
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
