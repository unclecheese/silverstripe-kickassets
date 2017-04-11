<?php

class KickAssetsTest extends SapphireTest
{
    protected static $fixture_file = 'fixtures.yml';

    /**
     * @covers KickAssets
     */
    public function testKickAssets()
    {
        $kickAssets = KickAssets::create();

        /** @var Folder $folder */
        $folder = Folder::find_or_make('my-dummy-folder');

        file_put_contents(Controller::join_links(ASSETS_PATH, 'my-dummy-folder', 'dummy1.png'), base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='));

        /** @var Image $image */
        $image = $this->objFromFixture('Image', 'one');


        $this->assertTrue(is_array($kickAssets->createFolderJson($folder)));
        $this->assertTrue(is_array($kickAssets->createFileJson($image, $folder)));
    }

}