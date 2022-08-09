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
import config from '../../config/appConfig'
export default function OidcSignIn({ signOutReason }) {
  const auth = useAuth()
  console.log("authScope", config.authScope)
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
                            onClick={() =>
                               auth.signinRedirect({
                                scope: config.authScope ? config.authScope : 'openid profile email',
                              })
                            }
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
