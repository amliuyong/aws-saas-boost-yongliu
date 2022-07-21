import { Fragment } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Row,
  Alert,
} from 'reactstrap'
import { useAuth } from 'react-oidc-context'
import { Redirect } from 'react-router-dom'
export function OidcSignIn({ signOutReason }) {
  const auth = useAuth()

  const signInHandler = () => {
    const sigInProps = { scope: 'openid profile email' }

    if (process.env.REACT_APP_OIDC_SCOPE) {
      sigInProps.scope = process.env.REACT_APP_OIDC_SCOPE
    }
    if (process.env.REACT_APP_OIDC_AUDIENCE) {
      sigInProps.extraQueryParams = {
        audience: process.env.REACT_APP_OIDC_AUDIENCE,
      }
    }
    auth.signinRedirect(sigInProps)
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
                    {!!signOutReason && (
                      <Alert color="warning" isOpen={!!signOutReason}>
                        {signOutReason}
                      </Alert>
                    )}

                    {!auth.isAuthenticated && (
                      <Row>
                        <Col xs="6">
                          <Button
                            color="primary"
                            className="px-4"
                            type="button"
                            onClick={signInHandler}
                          >
                            Login
                          </Button>
                        </Col>
                      </Row>
                    )}
                    {auth.isAuthenticated && <Redirect to="/"></Redirect>}
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
