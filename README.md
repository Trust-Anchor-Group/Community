# Community

Free Community Service that runs on any [TAG Neuron(R)](https://lab.tagroot.io/Documentation/Index.md). Allows anyone with a 
[TAG ID](https://github.com/Trust-Anchor-Group/IdApp) to create posts and reply to posts. Viewing, linking to and browsing posts 
and topics is free for all.

## Development

The community service runs on any [IoT Gateway Host](https://github.com/PeterWaher/IoTGateway). This includes the
[TAG Neuron(R)](https://lab.tagroot.io/Documentation/Index.md), The IoT Gateway itself, or [Lil'Sis'](https://lils.is/), 
which you can run on your local machine. To simplify development, once the project is cloned, add a `FileFolder` reference
to your repository folder in your [gateway.config file](https://lab.tagroot.io/Documentation/IoTGateway/GatewayConfig.md). 
This allows you to test and run your changes immediately, without having to synchronize the folder contents with an external 
host, or go through the trouble of generating a distributable software package just for testing purposes.

Example:

```
<FileFolders>
  <FileFolder webFolder="/Community" folderPath="C:\My Projects\Community"/>
</FileFolders>
```

**Note**: Once file folder reference is added, you need to restart the IoT Gateway service for the change to take effect.

## Main Page

The main page of the community service is `/Community/Index.md`.
