# API Documentation (v0)

This document outlines the available API endpoints for Ethproofs.

## Base URL

All API endpoints are relative to:

```
https://main--ethproofs.netlify.app
```

For example, the full URL for submitting a proof would be:

```
https://main--ethproofs.netlify.app/api/v0/proofs
```

## Authentication

All endpoints require authentication using an API key in the request header:

```http
Authorization: Bearer <your_api_key>
```

## Proofs API

### Submit Proof

`POST /api/v0/proofs`

Submit a new proof or update an existing one. The request body schema varies based on the `proof_status` field.

#### Request Body

For `proof_status: "queued"`:

```json
{
  "block_number": number,
  "machine_id": number,
  "proof_status": "queued",
  "proof_id": number (optional)
}
```

For `proof_status: "proving"`:

```json
{
  "block_number": number,
  "machine_id": number,
  "proof_status": "proving",
  "proof_id": number (optional)
}
```

For `proof_status: "proved"`:

```json
{
  "block_number": number,
  "machine_id": number,
  "proof_status": "proved",
  "proof_id": number (optional),
  "proof": string,
  "proof_latency": number, // in milliseconds
  "proving_cost": number, // in USD
  "proving_cycles": number
}
```

#### Response

- Success (200): Returns the proof ID

```json
{
  "proof_id": "string"
}
```

- Error Responses:
  - 400: Invalid payload
  - 401: Invalid API key
  - 404: Machine not found
  - 500: Internal server error or block not found

#### Notes

- If no `proof_id` is provided, the system will attempt to find an existing proof for the `block_number` and `machine_id`
- Timestamps are automatically set based on the proof status
- Block data is automatically fetched and stored if the block doesn't exist in the database

## Prover Machines API

### List Machines

`GET /api/v0/machines`

Retrieve all prover machines associated with the authenticated user.

#### Response

- Success (200): Returns array of machines

```json
[
  {
    "machine_id": number,
    "machine_name": string,
    "machine_description": string (optional),
    "machine_hardware": string (optional)
  }
]
```

- Error Responses:
  - 401: Invalid API key
  - 500: Internal server error

### Register Machine

`POST /api/v0/machines`

Register a new prover machine.

#### Request Body

```json
{
  "machine_name": string, // Human-readable name (e.g., "ZKnight-01", "SNARK-Sentinel")
  "machine_description": string (optional), // Description of the machine (e.g., "Primary RISC-V prover")
  "machine_hardware": string (optional), // Technical specifications (e.g., "RISC-V Prover", "STARK-to-SNARK Prover")
  "machine_cycle_type": string (optional) // Type of cycle (e.g., "SP1")
}
```

#### Response

- Success (200): Returns the created machine details

```json
{
  "machine_id": number
}
```

- Error Responses:
  - 400: Invalid payload
  - 401: Invalid API key
  - 500: Internal server error


## AWS Pricing List API

### Get AWS Pricing List

Data is fetched from https://aws.amazon.com/ec2/pricing/on-demand/

`GET /api/v0/aws_pricing_list`

Retrieve the list of AWS EC2 instance types and their pricing.

#### Response

- Success (200): Returns array of instance types and their pricing
