import { useEffect, useRef, useContext } from "react";
import validator from "validator";
import { useHistory } from 'react-router-dom';
import withModal from "../common/Modal";
import SignUp from "../register/SignUp";
import Context from "../../context";
import { auth, realTimeDb } from "../../firebase";

const Login = (props) => {
  const { toggleModal } = props;

  const { setUser, setIsLoading, cometChat } = useContext(Context);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const history = useHistory();

  useEffect(() => { 
    const authenticatedUser = JSON.parse(localStorage.getItem('auth'));
    if (authenticatedUser) { 
      history.push('/');
    } else {
      setUser(null);
    }
  }, [history, setUser]);

  const getInputs = () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    return { email, password };
  };

  const isUserCredentialsValid = (email, password) => {
    return validator.isEmail(email) && password;
  };

  const loginCometChat = (user) => {
    const authKey = `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`;
    cometChat.login(user.id, authKey).then(
      User => {
        setUser(user);
        setIsLoading(false);
        localStorage.setItem('auth', JSON.stringify(user));
        history.push('/');
      },
      error => {
      }
    );
  };

  const login = () => {
    setIsLoading(true);
    const { email, password } = getInputs();
    if (isUserCredentialsValid(email, password)) {
      auth.signInWithEmailAndPassword(email, password).then((userCredential) => {
        realTimeDb.ref().child('users').orderByChild('email').equalTo(email).on("value", function (snapshot) {
          const val = snapshot.val();
          if (val) {
            const keys = Object.keys(val);
            const user = val[keys[0]];
            loginCometChat(user);
          }
        });
      })
        .catch((error) => {
          setIsLoading(false);
          alert(`Your user's name or password is not correct`);
        });
    } else {
      setIsLoading(false);
      alert(`Your user's name or password is not correct`);
    }
  };

  return (
    <div className="login__container">
      <div className="login__welcome">
        <p><span style={{color: "#404EED", fontWeight: 'bold', fontSize: '2.5em', marginLeft: '1.5em'}}>Talkrrr!</span></p>
      </div>
      <div className="login__form-container">
        <div className="login__form">
          <input
            type="text"
            placeholder="Email or phone number"
            ref={emailRef}
          />
          <input type="password" placeholder="Password" ref={passwordRef} />
          <button className="login__submit-btn" onClick={login}>
            Login
          </button>
          <span className="login__forgot-password">Forgot password?</span>
          <span className="login__signup" onClick={() => toggleModal(true)}>Create New Account</span>
        </div>
      </div>
    </div>
  );
}

export default withModal(SignUp)(Login);
