/* eslint-disable max-len */
import config from '../Config';
import { Logger } from '../Util/Logger';

const { Storage } = require('@google-cloud/storage');
export class GcpClient {
  public readonly credentials: any;
  public readonly storage: any;
  public readonly authorizedClient: any = {};
  public readonly bucket: any;

  constructor() {
    this.credentials = {
      type: config.GCP.TYPE,
      project_id: config.GCP.PROJECT,
      private_key_id: config.GCP.PRIVATE_KEY_ID,
      private_key: `-----BEGIN PRIVATE KEY-----\n${config.GCP.PRIVATE_KEY}\n-----END PRIVATE KEY-----\n`,
      client_email: config.GCP.CLIENT_EMAIL,
      client_id: config.GCP.CLIENT_ID,
      auth_uri: config.GCP.AUTH_URI,
      token_uri: config.GCP.TOKEN_URI,
      auth_provider_x509_cert_url: config.GCP.AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: config.GCP.CLIENT_X509_CERT_URL,
      universe_domain: config.GCP.UNIVERSE_DOMAIN,
    };
  }
  /**
   *  Get google authorization
   * @returns
   */
  public async authorize(): Promise<any> {
    try {
      Logger.info('gcp-Client>GcpClient: Reached authorize', 'authorize');
      return new Storage({
        credentials: this.credentials,
      });
    } catch (err) {
      Logger.error('gcp-Client>GcpClient: Error in authorize', 'authorize', err);
      return err;
    }
  }
}
