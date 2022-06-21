import { Fragment } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Row,
} from 'reactstrap'
import { Redirect } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export function SignIn() {
  const { user, loginWithRedirect, loginWithPopup } = useAuth0()
  console.log('SignIn.user', user)
  const login = async () => {
    console.log('login')
    await loginWithRedirect()
  }

  return (
    <Fragment>
      <div className="app d-flex min-vh-100 align-items-center bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    {!user && (
                      <Row>
                        <Col xs="6">
                          <Button
                            color="primary"
                            className="px-4"
                            type="button"
                            onClick={login}
                          >
                            Login
                          </Button>
                        </Col>
                      </Row>
                    )}
                    {user && <Redirect to="/"></Redirect>}
                  </CardBody>
                </Card>
                <Card
                  className="text-white bg-primary py-5 d-none d-lg-block"
                  style={{ width: '44%' }}
                >
                  <CardBody className="text-center">
                    <div>
                      <h2>AWS SaaS Boost</h2>
                      <div>
                        <img
                          src="/saas-boost-login.png"
                          alt="SaasFactory"
                          width="80%"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  )
}
