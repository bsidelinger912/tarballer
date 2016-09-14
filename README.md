# TarBaller

Tarballer offers a fast and reliable method for pinning packages down during development and gaining guaranteed results
during CI builds. It is currently equipped to work with your existing S3 account, as well as remote servers accessible via SSH or your local file system. It achieves similar dependability to setting up mirrors, but is much simpler.  Each tarball contains an exact snapshot of your package folder, uniquely named so that you can easily store different package sets for different code branches. The tarball file name is written to tarballer.lock.json which should be committed with the code that relies on it.

## Getting started

Tarballer is a cli and should be installed globally on both your dev machine and your ci server.

`$ npm install -g @discodigital/tarballer`

In your project run the following to create a default configuration file (tarballer.json):

`$ tarballer init`

Check the contents of tarballer.json and you'll see:

```
{
  "defaults": {
    "remote": "https://s3.amazonaws.com/npm-tarballs/",
    "exclusions": []
  },
  "packages": [
    "./node_modules"
  ]
}
```

This is the setup for a node project which will be saved to s3.  If you're using s3 you'll need to provide an AWS shared credentials file (~/.aws/credentials), or environment variables, to allow tarballer upload/download to your own s3 account.  Read the [AWS documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html) to learn how to set up your credentials.

You can also connect to a remote server via SSH.  If you're already set up to SSH into your box then you can use a configuration like this to store your tarballs there:

```
{
  "packages": [
    {
      "local": "./node_modules",
      "remote": "bsidelinger@some-dev-box.something.io/users/bsidelinger/tarballs/",
      "privateKey": "/Users/bsidelinger/.ssh/id_rsa",
      "passphrase": "PWh3re"
    }
  ]
}
```

A configuration for using your local filesystem would look like this:

```
{
  "packages": [
    {
      "local": "./node_modules",
      "remote": "/Users/bsidelinger/tarballs/"
    }
  ]
}
```

## Configuration

The tarballer.json file has two major sections packages and defaults.  If a package is just a string, the string will represent the local folder location and it'll use the defaults for the other configurations.  If the package is an object it'll extend the defaults.  Here are the current configuration options for each package:

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Description</th>
    </tr>
  <thead>
  <tbody>
    <tr>
      <td>local</td>
      <td>The path to the local folder of packages</td>
    </tr>
    <tr>
      <td>remote</td>
      <td>The path to the remote location (this is parsed to determine what type of remote is is (s3, ssh, file system))</td>
    </tr>
    <tr>
      <td>privateKey</td>
      <td>The path to your private key when using SSH</td>
    </tr>
    <tr>
      <td>passphrase</td>
      <td>
        The passphrase for your private key.
        ** warning if this is sensitive, don't commit it to source code, we'll be adding a prompt for this soon.
      </td>
    </tr>
  </tbody>
</table>
