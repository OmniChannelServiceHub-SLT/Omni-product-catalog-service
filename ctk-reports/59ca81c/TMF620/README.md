# TM Forum Open API – Conformance Test Kit (CTK)

This Conformance Test Kit (CTK) allows you to validate that your Open API implementation conforms to the TM Forum specification for a specific API (e.g., TMF622, TMF679). It tests whether your implementation meets the mandatory and optional features defined in the associated Conformance Profile.

You can use this CTK as part of the **formal certification process** or for internal quality assurance during development.


## Prerequisites

- **Docker Desktop** is installed and running.
- On **Windows 11**, make sure that:
  - Virtualization is enabled in the BIOS
  - [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install) is installed and set as default


## Configuration

Before running the CTK, edit the `config.json` file to match your API deployment:

```json
{
    "url": "http://tmf622-ri:8622/tmf-api/productOrderingManagement/v4/",
    "headers": {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    "payloads": {
        "ProductOrder": {
            "POST": {
                "payload": {
                    "category": "B2C product order",
                    "description": "Product Order illustration sample",
                    "externalId": [
                      {
                        "@type": "ExternalIdentifier",
                        "owner": "TMF",
                        "externalIdentifierType": "POnumber",
                        "id": "456"
                      }
                    ],
                }
            }
        }
    }
}
```

- `url`: Base URL of your API (must be accessible from Docker)
- `headers`: Optional HTTP headers (e.g., authentication)
- `payloads`: Optional request bodies for operations that require them. Use operation names as defined in the OpenAPI spec or conformance profile.
-  the tests within the CTK run in sequence, starting with a POST. The results of the POST fuel the {id} of the corresponding GET/PATCH/DELETE tests.

**Tip:** Read the Conformance Profile located in the `conformance/` folder to understand which operations and features will be tested.


## Proxy Configuration
If your environment requires outbound traffic to go through a corporate or network proxy, the CTK Docker image can be configured by adding values to the .env file supplied with the CTK. 
Note: .env is a hidden file and is usually edited from the command line.

- for example:
```
HTTP_PROXY=http://proxy-host:3128
HTTPS_PROXY=http://proxy-host:3128
```

Hosts that should bypass the proxy are specified by setting the NO_PROXY variable. These typically include localhost, loopback addresses, and services running on the same Docker network (such as the TMF RI).
- for example
```
NO_PROXY="localhost,127.0.0.1,tmf,tmf620-ri"
```

If these environment variables are not set, the default values will be used.

## Other Docker Networks
If your implementation is running on a different network and does not expose a reachable URL (host IP, DNS name, or published port), then the CTK will need to join the same network.
This can be done by adjusting the docker-compose.yaml file supplied.
- for example
```
networks:
  tmf:
    external: true
  ri_net:
    external: true

services:
  ctk:
    ...
    networks:
      - tmf
      - ri_net
```

## Run the CTK Tests

### Linux/macOS:
```bash
chmod +x run.sh
./run.sh
```

### Windows:
```cmd
run.bat
```

You will see test output logs in the terminal. Upon completion, a test report will be generated.


## View the Test Results

Open the following file in a browser:

 `./reports/htmlResults.htm `

This report shows the test results for each conformance criterion. Review all **mandatory** feature test cases — all must pass for your API to be considered conformant.


## Submitting for Certification

How to Request Official TM Forum API Conformance Certification

	1.  Complete the API Certification Report provided by your TM Forum contact.
  2.  Create a ZIP file containing the entire ./reports folder.
	3.	Send the ZIP file to your TM Forum contact, including the relevant API metadata (e.g., implementation URL, version, platform).
	4.	TM Forum will review the submission and, if all requirements are satisfied, issue an official Conformance Certification Badge.


## Troubleshooting

- **Connection errors:** Check that your API endpoint is publicly accessible and that the `url` in `config.json` is correct.
- **Authentication failures:** Ensure valid tokens or credentials are included in `headers`.



## Questions?

Contact: [openapi@tmforum.org](mailto:openapi@tmforum.org)